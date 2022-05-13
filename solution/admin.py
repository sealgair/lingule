from datetime import date, datetime, timezone, timedelta

from django.contrib import admin
from django.db import models
from django.forms import TextInput
from django.utils.html import format_html

from solution.models import Solution


def today():
    tz = timezone(timedelta(hours=14))
    return datetime.now(tz).date()


def shuffle_solutions(modeladmin, request, queryset):
    queryset = queryset.filter(date__gt=today())
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
            return queryset.filter(date__gt=today())
        elif self.value() == 'False':
            return queryset.filter(date__lte=today())


@admin.register(Solution)
class SolutionAdmin(admin.ModelAdmin):
    readonly_fields = ['order']
    fieldsets = (
        (None, {
            'fields': (
                ('word', 'romanization'),
                'ipa',
                'english',
                'font',
                'language',
                'alternates',
                ('date', 'order',),
            )
        }),
    )
    filter_horizontal = ['alternates']
    list_display = ['font_word', 'ipa', 'english', 'language', 'date', 'order']
    list_editable = ['date']
    list_filter = [UpcomingListFilter]
    actions = [shuffle_solutions]
    formfield_overrides = {
        models.TextField: {'widget': TextInput},
    }

    def font_word(self, obj):
        if obj.font:
            return format_html("""
            <style>
                @font-face {{
                    font-family: "Noto{id}";
                    src: url("{font}");
                }}
            </style>
            <span style="font-family: Noto{id}">{word}</span>
            """, id=obj.id, word=obj.word, font=obj.font_url)
        else:
            return obj.word
