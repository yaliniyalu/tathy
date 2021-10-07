<?php
$dir = "";
$secret = "";

checkHookSecret($secret);

if (!file_exists("deploy.json")) {
    file_put_contents("deploy.json", json_encode(['last-commit' => null]));
}

$deploy = json_decode(file_get_contents("deploy.json"), true);

if (!file_exists($dir)) {
    mkdir($dir, 0755, true);
    chdir($dir);
    exec_cmd("git clone https://github.com/yaliniyalu/tathy.git");
}

$lastCommit = $deploy['last-commit'];

chdir($dir);
exec_cmd("git reset --hard HEAD && git pull");
$currentCommit = exec_cmd('git log -1 --pretty=format:"%H"');

if (!$lastCommit) {
    processApi();
    processAdmin();
} else {
    $res = exec_cmd("git rev-list {$lastCommit}..HEAD app");
    if ($res) {
        processApi();
    }

    $res = exec_cmd("git rev-list {$lastCommit}..HEAD admin");
    if ($res) {
        processAdmin();
    }
}

chdir(__DIR__);
file_put_contents("deploy.json", json_encode([ "last-commit" => $currentCommit ]));

function processApi() {
    exec_cmd("cd api && yarn && pm2 restart app");
}

function processAdmin() {
    exec_cmd("cd admin && yarn && quasar build");
}

set_exception_handler(function () {
    deploy_log("exception");
    echo "Deploy failed";
});

/**
 * @throws Exception
 */
function checkHookSecret($secret)
{
    $headers = getallheaders();
    if (!isset($headers['X-Hub-Signature'])) {
        throw new \Exception("HTTP header 'X-Hub-Signature' is missing.");
    } elseif (!extension_loaded('hash')) {
        throw new \Exception("Missing 'hash' extension to check the secret code validity.");
    }

    list($algo, $hash) = explode('=', $headers['X-Hub-Signature'], 2) + array('', '');
    if (!in_array($algo, hash_algos(), TRUE)) {
        throw new \Exception("Hash algorithm '$algo' is not supported.");
    }

    $rawPost = file_get_contents('php://input');
    if ($hash !== hash_hmac($algo, $rawPost, $secret)) {
        throw new \Exception('Hook secret does not match.');
    }
}

function deploy_log($data) {
    file_put_contents("./logs.txt", $data, FILE_APPEND);
}

function exec_cmd($cmd) {
    deploy_log(">>>" . $cmd . "\n");
    $res = shell_exec("cd api && yarn && pm2 restart app");
    deploy_log($res . "\n");
    return $res;
}
