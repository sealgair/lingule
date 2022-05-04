from django.contrib import admin

from language.models import Language


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'macroarea',
        'family',
        'subfamily',
        'genus',
        'latitude',
        'longitude',
        'hidden',
    ]
    list_editable = ['hidden']
    list_filter = ['hidden']
    search_fields = [
        'name',
        'family__name',
        'subfamily__name',
        'genus__name',
    ]
