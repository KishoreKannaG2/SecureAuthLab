from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, ProtectedData


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model  = User
        fields = ['username', 'email', 'full_name', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        try:
            user_obj = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid credentials.')

        # Check lockout BEFORE authenticating
        if user_obj.is_account_locked():
            remaining = (user_obj.locked_until - timezone.now()).seconds // 60
            raise serializers.ValidationError(
                f'Account locked. Try again in {remaining} minute(s).'
            )

        user = authenticate(username=username, password=password)
        if not user:
            user_obj.increment_failed_attempts()
            attempts_left = max(0, 5 - user_obj.failed_attempts)
            raise serializers.ValidationError(
                f'Invalid credentials. {attempts_left} attempt(s) remaining before lockout.'
            )

        user.reset_failed_attempts()
        data['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'full_name', 'date_joined',
                  'last_login', 'is_locked', 'failed_attempts']
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_locked', 'failed_attempts']


class ProtectedDataSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProtectedData
        fields = ['id', 'title', 'secret', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
