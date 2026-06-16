<?php
// Reads DEPLOY_WEBHOOK_SECRET from .env without bootstrapping Laravel
$env = @parse_ini_file(__DIR__ . '/../.env') ?: [];
$secret = $env['DEPLOY_WEBHOOK_SECRET'] ?? '';

if (!$secret || !hash_equals($secret, $_SERVER['HTTP_X_DEPLOY_SECRET'] ?? '')) {
    http_response_code(403);
    exit('Forbidden');
}

file_put_contents('/home/u121664729/deploy-pending', date('Y-m-d H:i:s'));
echo 'Deploy queued at ' . date('Y-m-d H:i:s');
