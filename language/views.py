from language.models import Language
from lingule.utils import ApiView


class LanguagesView(ApiView):
    safe = False
    def get(self, request):
        return list(Language.objects.values('name', 'id'))