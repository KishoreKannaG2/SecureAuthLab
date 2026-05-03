from django.db import models
from django.utils import timezone


class LoginAttempt(models.Model):
    """
    Every login attempt (success or failure) is logged here.
    This is the core table the attack monitor reads from.
    """
    username   = models.CharField(max_length=50)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    success    = models.BooleanField(default=False)
    timestamp  = models.DateTimeField(default=timezone.now)
    user       = models.ForeignKey(
        'auth_app.User',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='login_attempts',
    )

    class Meta:
        db_table  = 'login_attempts'
        ordering  = ['-timestamp']

    def __str__(self):
        status = 'SUCCESS' if self.success else 'FAILED'
        return f'[{status}] {self.username} from {self.ip_address} at {self.timestamp}'


class AttackSession(models.Model):
    """
    Groups rapid consecutive failed attempts from same IP
    into a single detected attack session.
    """
    STATUS_CHOICES = [
        ('active',   'Active'),
        ('blocked',  'Blocked'),
        ('resolved', 'Resolved'),
    ]

    ip_address     = models.GenericIPAddressField()
    target_username= models.CharField(max_length=50)
    start_time     = models.DateTimeField(auto_now_add=True)
    end_time       = models.DateTimeField(null=True, blank=True)
    total_attempts = models.PositiveIntegerField(default=0)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    cracked        = models.BooleanField(default=False)

    class Meta:
        db_table = 'attack_sessions'
        ordering = ['-start_time']

    def __str__(self):
        return f'Attack from {self.ip_address} on {self.target_username} — {self.status}'

    def duration_seconds(self):
        end = self.end_time or timezone.now()
        return (end - self.start_time).seconds
