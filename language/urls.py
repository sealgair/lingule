from django.urls import path
from language import views

urlpatterns = [
    path('all.json', views.LanguagesView.as_view(), name='all_languages'),
]