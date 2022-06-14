from language.models import Language
from lingule.utils import ApiView


class LanguagesView(ApiView):
    safe = False

    def cache_timeout(self):
        return 60 * 60 * 24 * 5

    def cache_vary(self, request, *args, **kwargs):
        return [request.GET.get("language", 'en')]

    def get(self, request):
        lcode = request.GET.get("language", 'en')
        return [
            {
                'name': l.get_language(lcode),
                'id': l.id,
                'other_names': l.all_names
            }
            for l in Language.objects.exclude(hidden=True).prefetch_related('translations')
        ]
