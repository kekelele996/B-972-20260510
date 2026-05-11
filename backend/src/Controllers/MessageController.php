<?php

namespace App\Controllers;

use App\Models\Eloquent\Message;
use App\Utils\Request;
use App\Utils\Response;

class MessageController
{
    public function index(): void
    {
        $messages = Message::orderBy('created_at', 'desc')->get();
        Response::json($messages);
    }

    public function create(): void
    {
        $data = Request::json();
        $content = trim((string)($data['content'] ?? ''));
        if ($content === '') {
            Response::json(['error' => 'Missing content'], 400);
        }

        Message::create([
            'user_id' => isset($data['user_id']) && (int)$data['user_id'] > 0 ? (int)$data['user_id'] : null,
            'username' => (string)($data['username'] ?? 'Guest'),
            'content' => $content,
        ]);

        Response::json(['message' => 'Message posted']);
    }

    public function delete(): void
    {
        $id = Request::query('id');
        if (!$id) {
            Response::json(['error' => 'Missing ID'], 400);
        }

        $message = Message::find((int)$id);
        if (!$message) {
            Response::json(['error' => 'Message not found'], 404);
        }

        $message->delete();
        Response::json(['message' => 'Message deleted']);
    }
}

