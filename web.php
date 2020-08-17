<?php

use Gondr\App\Route;

if (isset($_SESSION['user'])) {
    Route::get("/", "MainController@index");
} else {
    Route::get("/", "MainController@login");
    Route::get("/register", "MainController@register");

    Route::post("/user/register", "UserController@register_process");
    Route::post("/user/login","UserController@login_process");
}