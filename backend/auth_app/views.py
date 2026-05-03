from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, ProtectedData
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    ProtectedDataSerializer,
)
from attack_monitor.models import LoginAttempt


class LoginRateThrottle(AnonRateThrottle):
    rate = '5/minute'
    scope = 'login'


def get_client_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'message': f'Account created for {user.username}.'},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes   = [LoginRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        ip_address = get_client_ip(request)
        username   = request.data.get('username', '')

        if serializer.is_valid():
            user = serializer.validated_data['user']

            # Update last login IP
            user.last_login_ip = ip_address
            user.save(update_fields=['last_login_ip'])

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            # Log successful attempt
            LoginAttempt.objects.create(
                username   = username,
                ip_address = ip_address,
                user_agent = request.META.get('HTTP_USER_AGENT', ''),
                success    = True,
                user       = user,
            )

            return Response({
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
                'user':    UserProfileSerializer(user).data,
            })

        # Log failed attempt
        LoginAttempt.objects.create(
            username   = username,
            ip_address = ip_address,
            user_agent = request.META.get('HTTP_USER_AGENT', ''),
            success    = False,
        )

        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except TokenError:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)


class ProtectedDataView(generics.ListCreateAPIView):
    serializer_class   = ProtectedDataSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProtectedData.objects.filter(owner=self.request.user)
