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
    ]
    search_fields = [
        'name',
        'family__name',
        'subfamily__name',
        'genus__name',
    ]
