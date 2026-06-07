<?php

namespace App\Enums;

enum RoleEnum: string
{
    case SUPER_ADMIN = 'SUPER_ADMIN';
    case ADMIN = 'ADMIN';
    case ENSEIGNANT = 'ENSEIGNANT';
    case ELEVE = 'ELEVE';
}
