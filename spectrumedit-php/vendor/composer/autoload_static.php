<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit53bd29f37f962dcf10436ebaa9a538ad
{
    public static $prefixLengthsPsr4 = array (
        'A' => 
        array (
            'App\\' => 4,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'App\\' => 
        array (
            0 => __DIR__ . '/../..' . '/app',
        ),
    );

    public static $classMap = array (
        'App\\Config' => __DIR__ . '/../..' . '/app/Config.php',
        'App\\SQLiteConnection' => __DIR__ . '/../..' . '/app/SQLiteConnection.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit53bd29f37f962dcf10436ebaa9a538ad::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit53bd29f37f962dcf10436ebaa9a538ad::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInit53bd29f37f962dcf10436ebaa9a538ad::$classMap;

        }, null, ClassLoader::class);
    }
}