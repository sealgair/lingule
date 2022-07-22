from django.contrib import admin
from django.db import models
from django.forms import TextInput

from language.models import Macroarea, Family, Subfamily, Genus, Language


@admin.register(Macroarea)
@admin.register(Family)
class LinguisticAdmin(admin.ModelAdmin):
    search_fields = ['name']
    list_display = ['name']
    exclude = []
    formfield_overrides = {
        models.TextField: {'widget': TextInput},
    }


@admin.register(Subfamily)
class SubfamilyAdmin(LinguisticAdmin):
    list_display = ['name', 'family']


@admin.register(Genus)
class GenusAdmin(LinguisticAdmin):
    list_display = ['name', 'family', 'subfamily']


@admin.register(Language)
class LanguageAdmin(LinguisticAdmin):
    fieldsets = (
        (None, {
            'fields': (
                ('name', 'lang_id'),
                'other_names',
                Language.translation_fields,
                'macroarea',
                ('family', 'subfamily', 'genus'),
                ('latitude', 'longitude'),
                'hidden',
            )
        }),
    )
    list_display = [
        'name',
        'macroarea',
        'family',
        'subfamily',
        'genus',
        'hidden',
    ]
    list_editable = ['hidden']
    list_filter = ['hidden', 'macroarea', 'family']
    search_fields = [
        'name',
        'lang_id',
        'other_names',
        'family__name',
        'subfamily__name',
        'genus__name',
    ]
