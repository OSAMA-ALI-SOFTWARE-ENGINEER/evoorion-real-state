<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/deploy', function () {
    $secret = '';
    $envPath = base_path('.env');
    foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (strpos($line, 'DEPLOY_WEBHOOK_SECRET=') === 0) {
            $secret = trim(substr($line, strlen('DEPLOY_WEBHOOK_SECRET=')), '"\'');
        }
    }

    if (!$secret || !hash_equals($secret, request()->header('X-Deploy-Secret', ''))) {
        abort(403);
    }

    ignore_user_abort(true);
    set_time_limit(300);

    $dir = '/home/u121664729/domains/osama-ali.com/public_html/evoorion-api.osama-ali.com';
    $log = date('Y-m-d H:i:s') . " — Deploy triggered\n";

    foreach ([
        "cd $dir && git config core.sshCommand 'ssh -i /home/u121664729/.ssh/deploy_key' && git pull origin master 2>&1",
        // Sync backend/ subdirectory (git-tracked) over the root app files
        "rsync -a --delete --exclude='.env' --exclude='storage/' --exclude='vendor/' $dir/backend/ $dir/ 2>&1",
        "cd $dir && composer install --no-dev --optimize-autoloader --no-interaction 2>&1",
        "cd $dir && php artisan migrate --force 2>&1",
        "cd $dir && php artisan db:seed --class=SiteSettingsSeeder --force 2>&1",
        "cd $dir && php artisan config:cache 2>&1",
        "cd $dir && php artisan route:cache 2>&1",
    ] as $cmd) {
        exec($cmd, $out, $code);
        $log .= "> $cmd\n" . implode("\n", $out) . "\n";
        $out = [];
    }

    file_put_contents('/home/u121664729/deploy.log', $log . "\n---\n", FILE_APPEND);
    return response($log, 200);
})->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
