<?php
$env = @parse_ini_file(__DIR__ . '/../.env') ?: [];
$secret = $env['DEPLOY_WEBHOOK_SECRET'] ?? '';

if (!$secret || !hash_equals($secret, $_SERVER['HTTP_X_DEPLOY_SECRET'] ?? '')) {
    http_response_code(403);
    exit('Forbidden');
}

ignore_user_abort(true);
set_time_limit(300);

$dir = '/home/u121664729/domains/osama-ali.com/public_html/evoorion-api.osama-ali.com';
$log = date('Y-m-d H:i:s') . " — Deploy triggered\n";

foreach ([
    "cd $dir && git config core.sshCommand 'ssh -i /home/u121664729/.ssh/deploy_key' && git pull origin master 2>&1",
    "cd $dir && composer install --no-dev --optimize-autoloader --no-interaction 2>&1",
    "cd $dir && php artisan migrate --force 2>&1",
    "cd $dir && php artisan config:cache 2>&1",
    "cd $dir && php artisan route:cache 2>&1",
] as $cmd) {
    exec($cmd, $out, $code);
    $log .= "> $cmd\n" . implode("\n", $out) . "\n";
    $out = [];
}

file_put_contents('/home/u121664729/deploy.log', $log . "\n---\n", FILE_APPEND);
echo $log;
