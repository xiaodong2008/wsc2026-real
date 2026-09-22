<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Starter02 · Server info</title>
    <style>
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f8fafc; color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; }
        main { width: min(520px, calc(100% - 32px)); }
        h1 { font-size: 28px; margin: 0 0 8px; }
        .hint { margin: 0 0 24px; color: #475569; }
        dl { margin: 0; background: #fff; border-radius: 16px; padding: 8px 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, .06); }
        div { display: grid; grid-template-columns: 140px 1fr; gap: 12px; padding: 16px 0; border-top: 1px solid #e2e8f0; }
        div:first-child { border-top: 0; }
        dt { font-weight: 700; }
        dd { margin: 0; font-variant-numeric: tabular-nums; }
        time { font-size: 20px; font-weight: 700; }
    </style>
</head>
<body>
    <main>
        <h1>Server info</h1>
        <p class="hint">Rendered on the server. View source, then refresh — the time string changes.</p>
        <dl>
            <div>
                <dt>Server time</dt>
                <dd><time datetime="{{ $iso }}">{{ $time }}</time></dd>
            </div>
            <div>
                <dt>PHP</dt>
                <dd>{{ $php }}</dd>
            </div>
            <div>
                <dt>Hostname</dt>
                <dd>{{ $host }}</dd>
            </div>
            <div>
                <dt>OS</dt>
                <dd>{{ $os }}</dd>
            </div>
        </dl>
    </main>
</body>
</html>
