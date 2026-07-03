<?php

namespace App\Enums;

enum NiveauClasseEnum: string
{
    case PRIMAIRE = 'Primaire';
    case COLLEGE = 'Collège';
    case LYCEE = 'Lycée';

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
            self::PRIMAIRE => 'Primaire',
            self::COLLEGE => 'Collège',
            self::LYCEE => 'Lycée',
        };
    }
}
