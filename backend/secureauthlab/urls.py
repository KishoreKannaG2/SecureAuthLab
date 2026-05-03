from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerUIView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth endpoints
    path('api/auth/', include('auth_app.urls')),

    # Attack monitoring endpoints
    path('api/monitor/', include('attack_monitor.urls')),

    # API docs (Swagger)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerUIView.as_view(url_name='schema'), name='swagger-ui'),
]
