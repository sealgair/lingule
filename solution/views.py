from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View

from language.models import Language
from solution.models import Solution


class WordView(View):
    def get(self, request):
        solution = Solution.objects.today().as_data()
        return JsonResponse({
            'word': solution.word,
            'ipa': solution.ipa,
            'english': solution.english,
        })


class GuessView(View):
    def post(self, request):
        language = get_object_or_404(Language, id=request.POST.get('lang_id', None))
        return JsonResponse({
            'correct': False,
            'hint': '🟩⬛⬛⬛↗️️',
        })


