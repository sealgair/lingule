import codecs
import csv
from functools import reduce, update_wrapper

from django import forms
from django.contrib import admin
from django.db import models
from django.db.models import Q
from django.forms import TextInput, Textarea
from django.utils.html import format_html
from django.views.generic import FormView

from language.models import Language
from solution.models import Solution, today


def shuffle_solutions(modeladmin, request, queryset):
    queryset.shuffle()


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
                ('font', 'vertical'),
                ('date', 'freeze_date', 'order'),
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

    def get_urls(self):
        urls = super().get_urls()

        from django.urls import path

        def wrap(view):
            def wrapper(*args, **kwargs):
                return self.admin_site.admin_view(view)(*args, **kwargs)

            wrapper.model_admin = self
            return update_wrapper(wrapper, view)

        info = self.model._meta.app_label, self.model._meta.model_name

        return [
            path("upload/", wrap(ImportCsv.as_view()), name="%s_%s_upload" % info),
        ] + urls

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


class UploadFileForm(forms.Form):
    file = forms.FileField()
    shuffle = forms.BooleanField(initial=True, required=False)


class ImportCsv(FormView):
    template_name = "admin/solution/upload.html"
    form_class = UploadFileForm

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        data['opts'] = Solution._meta
        return data

    def form_valid(self, form):
        file = form.cleaned_data['file']
        reader = csv.DictReader(codecs.iterdecode(file, 'utf-8'))

        def skey(val):
            if isinstance(val, Solution):
                lang = val.language.lang_id
                word = val.word
            else:
                lang = val['language']
                word = val['word']
            return f'{lang}:{word}'

        known = {
            skey(s)
            for s in Solution.objects.prefetch_related()
        }
        langs_cache = {}
        errors = []
        solutions = []
        alternates = {}
        for row in reader:
            if skey(row) in known:
                continue

            languages = []
            for code in row['language'].split(','):
                code = code.strip()
                if code not in langs_cache:
                    try:
                        langs_cache[code] = Language.objects.get(lang_id=code)
                    except Language.DoesNotExist:
                        langs_cache[code] = Language(name="error")
                        errors.append(f"Language code does not exist: {code}")
                    except Language.MultipleObjectsReturned:
                        langs_cache[code] = Language(name="error")
                        errors.append(f"Multiple languages found for {code}")
                languages.append(langs_cache[code])
            solution = Solution(
                language=languages[0],
                word=row['word'],
                romanization=row['romanization'],
                ipa=row['ipa'],
                english=row['english'],
                es=row['spanish'],
                fr=row['french'],
                zh=row['chinese'],
            )
            solutions.append(solution)
            if len(languages) > 1:
                alternates[skey(solution)] = languages[1:]
        if errors:
            self.extra_context = {
                'errors': errors
            }
            return self.get(self.request)
        solutions = Solution.objects.bulk_create(solutions)
        bulk_alts = []
        Alternate = Solution.alternates.through
        for solution in solutions:
            bulk_alts.extend([
                Alternate(
                    solution=solution,
                    language=language
                )
                for language in alternates.get(skey(solution), [])
            ])
        Alternate.objects.bulk_create(bulk_alts)

        self.extra_context = {
            'solutions': solutions
        }
        if form.cleaned_data['shuffle']:
            Solution.objects.all().shuffle()
        return self.get(self.request)

