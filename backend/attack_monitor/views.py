from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import LoginAttempt, AttackSession
from auth_app.models import User


class LoginAttemptsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        attempts = LoginAttempt.objects.select_related('user').order_by('-timestamp')[:200]
        data = [
            {
                'id':         a.id,
                'username':   a.username,
                'ip_address': a.ip_address,
                'success':    a.success,
                'timestamp':  a.timestamp.isoformat(),
                'user_agent': a.user_agent[:80],
            }
            for a in attempts
        ]
        return Response(data)


class AttackStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now       = timezone.now()
        last_hour = now - timedelta(hours=1)
        last_day  = now - timedelta(days=1)

        total_attempts     = LoginAttempt.objects.count()
        failed_attempts    = LoginAttempt.objects.filter(success=False).count()
        successful_logins  = LoginAttempt.objects.filter(success=True).count()
        attempts_last_hour = LoginAttempt.objects.filter(timestamp__gte=last_hour).count()
        attempts_last_day  = LoginAttempt.objects.filter(timestamp__gte=last_day).count()

        # Top attacking IPs
        top_ips = (
            LoginAttempt.objects
            .filter(success=False, timestamp__gte=last_day)
            .values('ip_address')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        # Top targeted usernames
        top_targets = (
            LoginAttempt.objects
            .filter(success=False, timestamp__gte=last_day)
            .values('username')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        # Locked accounts
        locked_users = User.objects.filter(is_locked=True).values(
            'username', 'failed_attempts', 'locked_until'
        )

        return Response({
            'total_attempts':     total_attempts,
            'failed_attempts':    failed_attempts,
            'successful_logins':  successful_logins,
            'attempts_last_hour': attempts_last_hour,
            'attempts_last_day':  attempts_last_day,
            'top_attacking_ips':  list(top_ips),
            'top_targeted_users': list(top_targets),
            'locked_accounts':    list(locked_users),
        })


class ResetLockoutView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
            user.reset_failed_attempts()
            return Response({'message': f'Lockout cleared for {username}.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)


class AttackSessionsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        sessions = AttackSession.objects.order_by('-start_time')[:50]
        data = [
            {
                'id':             s.id,
                'ip_address':     s.ip_address,
                'target_username':s.target_username,
                'start_time':     s.start_time.isoformat(),
                'total_attempts': s.total_attempts,
                'status':         s.status,
                'cracked':        s.cracked,
                'duration_s':     s.duration_seconds(),
            }
            for s in sessions
        ]
        return Response(data)
