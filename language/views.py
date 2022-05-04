from language.models import Language
from lingule.utils import ApiView


class LanguagesView(ApiView):
    safe = False

    def cache_timeout(self):
        return 60*60*24*5

    def get(self, request):
        return list(Language.objects.exclude(hidden=True).values('name', 'id'))