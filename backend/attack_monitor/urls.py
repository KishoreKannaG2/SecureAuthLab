from django.urls import path
from . import views

urlpatterns = [
    path('attempts/',  views.LoginAttemptsView.as_view(),  name='monitor-attempts'),
    path('stats/',     views.AttackStatsView.as_view(),    name='monitor-stats'),
    path('sessions/',  views.AttackSessionsView.as_view(), name='monitor-sessions'),
    path('reset/',     views.ResetLockoutView.as_view(),   name='monitor-reset'),
]
