from django.http import JsonResponse
from django.views import View


class ApiView(View):
    safe = True
    def dispatch(self, request, *args, **kwargs):
        result = super().dispatch(request, *args, **kwargs)
        response = JsonResponse(result, safe=self.safe)
        return response