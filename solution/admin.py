from datetime import datetime, timezone, timedelta
from functools import reduce

from django.contrib import admin
from django.db import models
from django.db.models import Q
from django.forms import TextInput, Textarea
from django.utils.html import format_html

from solution.models import Solution


def today():
    tz = timezone(timedelta(hours=14))
    return datetime.now(tz).date()


def shuffle_solutions(modeladmin, request, queryset):
    queryset = queryset.filter(date__gt=today(), freeze_date=False)
    for (o, d), s in zip(queryset.values_list('order', 'date'), queryset.order_by('?')):
        queryset.filter(id=s.id).update(order=o, date=d)


class TranslationMissingListFilter(admin.SimpleListFilter):
    title = "Missing Translations"
    parameter_name = 'notrans'

    def lookups(self, request, model_admin):
        return (
            ('True', 'Yes'),
            ('False', 'No'),
        )

    def queryset(self, request, queryset):
        q = [
            Q(**{lc: ''})
            for lc in Solution.translation_fields
        ]
        q = reduce(lambda a, b: a | b, q)
        if self.value() == 'True':
            return queryset.filter(q)
        elif self.value() == 'False':
            return queryset.filter(~q)


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
                ('word', 'romanization', 'ipa'),
                ('english',) + Solution.translation_fields,
                'language',
                'alternates',
                'hidden_options',
                ('victory_message', 'failure_message'),
                'font',
                ('date', 'freeze_date', 'order',),
            )
        }),
    )
    filter_horizontal = ['alternates', 'hidden_options']
    list_display = ['font_word', 'ipa', 'english', 'language', 'date', 'freeze_date', 'order']
    list_editable = ['date', 'freeze_date']
    list_filter = [UpcomingListFilter, TranslationMissingListFilter]
    actions = [shuffle_solutions]
    formfield_overrides = {
        models.TextField: {'widget': TextInput},
    }

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name.endswith('_message'):
            kwargs['widget'] = Textarea
        return super().formfield_for_dbfield(db_field, request, **kwargs)

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
