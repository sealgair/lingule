from django.contrib import admin
from django.db import models
from django.forms import TextInput

from i18n.admin import TranslatableForm
from language.models import Macroarea, Family, Subfamily, Genus, Language


@admin.register(Macroarea)
@admin.register(Family)
class NamedTaxonAdmin(admin.ModelAdmin):
    list_display = ['name']
    exclude = []
    form = TranslatableForm


@admin.register(Subfamily)
class SubfamilyAdmin(admin.ModelAdmin):
    list_display = ['name', 'family']
    exclude = []
    form = TranslatableForm


@admin.register(Genus)
class GenusAdmin(admin.ModelAdmin):
    list_display = ['name', 'family', 'subfamily']
    exclude = []
    form = TranslatableForm


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    form = TranslatableForm
    fieldsets = (
        (None, {
            'fields': (
                ('name', 'lang_id'),
                'other_names',
                TranslatableForm.translation_fields,
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
        'other_names',
        'family__name',
        'subfamily__name',
        'genus__name',
    ]
    formfield_overrides = {
        models.TextField: {'widget': TextInput},
    }
