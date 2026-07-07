<?php

namespace App\Enums;

enum NiveauClasseEnum: string
{
    case SECONDE = 'Seconde';
    case PREMIERE = 'Première';
    case TERMINALE = 'Terminale';

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $niveau): array => [
                'value' => $niveau->value,
                'label' => $niveau->label(),
            ],
            self::cases()
        );
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $niveau): string => $niveau->value, self::cases());
    }

    public function label(): string
    {
        return match ($this) {
            self::SECONDE => 'Seconde',
            self::PREMIERE => 'Première',
            self::TERMINALE => 'Terminale',
        };
    }
}
