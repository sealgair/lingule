from django.contrib import admin
from django.db import models
from django.forms import TextInput

from solution.models import Solution


@admin.register(Solution)
class SolutionAdmin(admin.ModelAdmin):
    readonly_fields = ['order']
    fieldsets = (
        (None, {
            'fields': (
                'word',
                'ipa',
                'english',
                'language',
                ('date', 'order',),
            )
        }),
    )
    list_display = ['word', 'english', 'language', 'date', 'order']
    list_editable = ['date']
    formfield_overrides = {
        models.TextField: {'widget': TextInput},
    }