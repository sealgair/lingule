from django.forms import ModelForm, fields
from django.forms.models import ModelFormMetaclass

from i18n.models import LANGUAGE_CHOICES, Translation


class TranslatableFormMetaclass(ModelFormMetaclass):

    def __new__(mcs, name, bases, attrs):
        new_class = super().__new__(mcs, name, bases, attrs)
        trans_fields = {
            lc: fields.CharField(max_length=256, required=True, label=lang)
            for lc, lang in LANGUAGE_CHOICES
        }
        new_class.translation_fields = tuple(trans_fields.keys())
        new_class.base_fields.update(trans_fields)
        return new_class


class TranslatableForm(ModelForm, metaclass=TranslatableFormMetaclass):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.id:
            self.initial.update({
                trans.language: trans.value
                for trans in self.instance.translations.all()
            })

    def _save_m2m(self):
        super()._save_m2m()
        cleaned_data = self.cleaned_data
        for lc, lang in LANGUAGE_CHOICES:
            try:
                trans = self.instance.translations.get(language=lc)
            except Translation.DoesNotExist:
                trans = Translation(object=self.instance, language=lc)
            trans.value = cleaned_data[lc]
            trans.save()
