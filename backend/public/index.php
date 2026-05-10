<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Eloquent;
use App\Controllers\AuthController;
use App\Controllers\MessageController;
use App\Controllers\OrderController;
use App\Controllers\ProductController;
use App\Controllers\PromotionController;
use App\Utils\Response;

// 初始化 Eloquent ORM
Eloquent::initialize();

// 错误处理
error_reporting(E_ALL);
ini_set('display_errors', 0);

set_exception_handler(function ($exception) {
    Response::json([
        'success' => false,
        'message' => '服务器内部错误',
        'error' => $exception->getMessage(),
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'trace' => getenv('APP_DEBUG') === 'true' ? $exception->getTraceAsString() : null,
    ], 500);
});

set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

date_default_timezone_set('Asia/Shanghai');

// CORS：统一由 PHP 入口输出，避免 Nginx/PHP 重复或缺失导致浏览器拦截
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = parse_url($requestUri, PHP_URL_PATH) ?: '/';

// 移除 /api 前缀
$path = preg_replace('#^/api#', '', $path);

$routes = [
    'GET /health' => function () {
        Response::json(['status' => 'ok', 'time' => date('Y-m-d H:i:s')]);
    },

    // Auth
    'POST /login' => [AuthController::class, 'login'],
    'POST /register' => [AuthController::class, 'register'],

    // Products
    'GET /products' => [ProductController::class, 'index'],
    'POST /products' => [ProductController::class, 'create'],
    'PUT /products' => [ProductController::class, 'update'],
    'DELETE /products' => [ProductController::class, 'delete'],

    // Messages
    'GET /messages' => [MessageController::class, 'index'],
    'POST /messages' => [MessageController::class, 'create'],
    'DELETE /messages' => [MessageController::class, 'delete'],

    // Orders
    'POST /orders' => [OrderController::class, 'create'],
    'GET /orders' => [OrderController::class, 'index'],
    'PUT /orders' => [OrderController::class, 'update'],

    // Promotions
    'GET /promotions' => [PromotionController::class, 'index'],
    'POST /promotions' => [PromotionController::class, 'create'],
    'PUT /promotions' => [PromotionController::class, 'update'],
    'DELETE /promotions' => [PromotionController::class, 'delete'],
];

$routeKey = "{$requestMethod} {$path}";

if (!isset($routes[$routeKey])) {
    Response::json(['error' => 'Not found', 'path' => $path], 404);
}

$handler = $routes[$routeKey];
if (is_callable($handler)) {
    $handler();
    exit;
}

$controller = new $handler[0]();
$controller->{$handler[1]}();
