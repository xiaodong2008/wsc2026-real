<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // The app is served behind a TLS-terminating ingress: the browser speaks
        // https to the load balancer, the load balancer speaks plain http to this
        // container, and the original scheme survives only in X-Forwarded-Proto.
        //
        // Without trusting that header Laravel believes the request arrived over
        // http, so route() and url() emit http:// links into a page the browser
        // loaded over https, and it blocks the resulting form POST as mixed
        // content. The symptom is a submit button that silently does nothing,
        // which points nowhere near the cause.
        //
        // The proxy is the cluster's own ingress, is not reachable from outside
        // it, and has no address that is knowable at build time — so trust any.
        $middleware->trustProxies(at: '*', headers: Request::HEADER_X_FORWARDED_FOR |
            Request::HEADER_X_FORWARDED_HOST |
            Request::HEADER_X_FORWARDED_PORT |
            Request::HEADER_X_FORWARDED_PROTO
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
