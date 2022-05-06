from datetime import date

from django.contrib import admin
from django.db import models
from django.forms import TextInput

from solution.models import Solution


def shuffle_solutions(modeladmin, request, queryset):
    queryset = queryset.filter(date__gt=date.today())
    for (o, d), s in zip(queryset.values_list('order', 'date'), queryset.order_by('?')):
        queryset.filter(id=s.id).update(order=o, date=d)


class UpcomingListFilter(admin.SimpleListFilter):
    title = "Upcoming"
    parameter_name = 'upcoming'

    def lookups(self, request, model_admin):
        return (
            ('True', 'Yes'),
            ('False', 'No'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'True':
            return queryset.filter(date__gt=date.today())
        elif self.value() == 'False':
            return queryset.filter(date__lte=date.today())


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
                'alternates',
                ('date', 'order',),
            )
        }),
    )
    list_display = ['word', 'ipa', 'english', 'language', 'date', 'order']
    list_editable = ['date']
    list_filter = [UpcomingListFilter]
    actions = [shuffle_solutions]
    formfield_overrides = {
        models.TextField: {'widget': TextInput},
    }
