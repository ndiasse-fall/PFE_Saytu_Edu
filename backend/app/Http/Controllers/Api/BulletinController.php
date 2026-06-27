<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BulletinService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BulletinController extends Controller
{
    public function __construct(
        private readonly BulletinService $bulletinService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $periode = $request->query('periode');

        $bulletins = $this->bulletinService->listerBulletins($periode);

        return response()->json($bulletins);
    }
}