<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Starter03 · Records</title>
    <style>
        body { margin: 0; background: #f8fafc; color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; }
        main { max-width: 880px; margin: 0 auto; padding: 40px 20px 64px; }
        h1 { margin: 0 0 8px; font-size: 28px; }
        p { margin: 0 0 20px; color: #475569; }
        .error { background: #fef2f2; color: #991b1b; padding: 12px 14px; border-radius: 10px; }
        table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; }
        th, td { text-align: left; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; }
        th { background: #0f172a; color: #f8fafc; font-size: 13px; letter-spacing: .04em; text-transform: uppercase; }
        tr:last-child td { border-bottom: 0; }
    </style>
</head>
<body>
    <main>
        <h1>Records</h1>
        <p>{{ $rows->count() }} rows from <code>starter03_records</code>.</p>
        @if ($error)
            <p class="error">{{ $error }}</p>
        @endif
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Recorded on</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $row)
                    <tr>
                        <td>{{ $row->id }}</td>
                        <td>{{ $row->name }}</td>
                        <td>{{ $row->category }}</td>
                        <td>{{ $row->score }}</td>
                        <td>{{ $row->recorded_on }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5">No rows yet. Run migrations, or import <code>database/data/records.csv</code>.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </main>
</body>
</html>
