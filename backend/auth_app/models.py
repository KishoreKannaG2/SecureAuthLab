from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)  # Django hashes this with PBKDF2
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model for SecureAuth Lab.
    Passwords are stored as PBKDF2-SHA256 hashes — never plain text.
    """
    username        = models.CharField(max_length=50, unique=True)
    email           = models.EmailField(unique=True)
    full_name       = models.CharField(max_length=100, blank=True)

    is_active       = models.BooleanField(default=True)
    is_staff        = models.BooleanField(default=False)
    is_locked       = models.BooleanField(default=False)  # Locked due to brute force

    failed_attempts = models.PositiveIntegerField(default=0)
    locked_until    = models.DateTimeField(null=True, blank=True)

    date_joined     = models.DateTimeField(default=timezone.now)
    last_login_ip   = models.GenericIPAddressField(null=True, blank=True)

    USERNAME_FIELD  = 'username'
    REQUIRED_FIELDS = ['email']

    objects = UserManager()

    class Meta:
        db_table = 'users'
        verbose_name = 'User'

    def __str__(self):
        return f'{self.username} ({self.email})'

    def is_account_locked(self):
        """Check if account is currently locked."""
        if self.is_locked and self.locked_until:
            if timezone.now() < self.locked_until:
                return True
            else:
                # Auto-unlock after lockout duration
                self.is_locked = False
                self.failed_attempts = 0
                self.locked_until = None
                self.save(update_fields=['is_locked', 'failed_attempts', 'locked_until'])
        return False

    def increment_failed_attempts(self):
        """Increment failed login counter; lock if threshold reached."""
        from django.conf import settings
        from datetime import timedelta

        self.failed_attempts += 1
        if self.failed_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            self.is_locked = True
            self.locked_until = timezone.now() + timedelta(
                minutes=settings.LOCKOUT_DURATION_MINUTES
            )
        self.save(update_fields=['failed_attempts', 'is_locked', 'locked_until'])

    def reset_failed_attempts(self):
        """Reset counter on successful login."""
        self.failed_attempts = 0
        self.is_locked = False
        self.locked_until = None
        self.save(update_fields=['failed_attempts', 'is_locked', 'locked_until'])


class ProtectedData(models.Model):
    """
    Simulated sensitive data table — this is what the attacker is trying to access.
    """
    owner       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='protected_data')
    title       = models.CharField(max_length=200)
    secret      = models.TextField()
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'protected_data'

    def __str__(self):
        return f'{self.title} — {self.owner.username}'
