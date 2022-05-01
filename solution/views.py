from django.conf import settings
from django.http import JsonResponse, Http404
from django.shortcuts import get_object_or_404
from django.views import View

from language.models import Language
from solution.models import Solution


class ApiView(View):

    def dispatch(self, request, *args, **kwargs):
        result = super().dispatch(request, *args, **kwargs)
        response = JsonResponse(result)
        return response


class WordView(ApiView):
    def get(self, request):
        try:
            solution = Solution.objects.today()
        except Solution.DoesNotExist:
            raise Http404()
        return {
            'id': solution.id,
            'word': solution.word,
            'ipa': solution.ipa,
            'meaning': solution.english,
        }


class GuessView(View):
    def post(self, request):
        guess = get_object_or_404(Language, id=request.POST.get('language_id', None))
        solution = get_object_or_404(Solution, id=request.POST.get('solution_id', None))
        return guess.compare(solution.language)
