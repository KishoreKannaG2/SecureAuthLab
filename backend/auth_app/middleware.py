from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse


class LoginAttemptMiddleware(MiddlewareMixin):
    """
    Middleware that blocks IPs making too many requests to /api/auth/login/.
    Acts as a first line of defence before even hitting the view.
    """

    BLOCKED_IPS_CACHE = {}  # In production, use Redis/cache
    MAX_ATTEMPTS      = 20  # Per IP per window
    WINDOW_SECONDS    = 60

    def process_request(self, request):
        if request.path == '/api/auth/login/' and request.method == 'POST':
            ip = self._get_ip(request)
            if self._is_ip_blocked(ip):
                return JsonResponse(
                    {'detail': 'Too many login attempts from your IP. Try again later.'},
                    status=429,
                )

    def _get_ip(self, request):
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            return x_forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')

    def _is_ip_blocked(self, ip):
        import time
        now   = time.time()
        entry = self.BLOCKED_IPS_CACHE.get(ip)

        if not entry:
            self.BLOCKED_IPS_CACHE[ip] = {'count': 1, 'window_start': now}
            return False

        if now - entry['window_start'] > self.WINDOW_SECONDS:
            self.BLOCKED_IPS_CACHE[ip] = {'count': 1, 'window_start': now}
            return False

        entry['count'] += 1
        return entry['count'] > self.MAX_ATTEMPTS
