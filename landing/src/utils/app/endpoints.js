export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: 'AUTH/login',
        REGISTER: 'AUTH/register',
        CODE: 'AUTH/code',
        CHECK_EMAIL: 'checkMail',
        DELETE_ACCOUNT: 'account-delete',
        RESET_PASSWORD: 'auth/resetpassword'
    },
    LEGAL: {
        TERMS: 'Legal/Terms',
    },
    SYNC: {
        REMOTESYNC: 'remoteSync',
        RAW: 'sync/raw'
    },
    OPS: {
        LOTES: {
            CRUD: 'lotes',
            ID: 'loteID',
            COSTS: 'getCosts'
        },
        INVENTARY: {
            CRUD: 'inventario',
            ID: 'InventByID'
        },
        COMPRAS: {
            CRUD: 'Compras',
            ID: 'ComprasById'
        },
        TASK: {
            CUD: 'tareas',
            READ: 'tareasByFinca',
            ID:'tareasByID'
        },
        CLIENTES: {
            CRUD: 'Cliente',
        },
        PERSONAL: {
            CRUD: 'personal',
            ID: 'personalByID',
            AUTH: 'registerPersonal',
            PLANILLA: 'planilla1',
            LOGS: 'logs'
        },
        VENTAS: {
            CRUD: 'ventas',
            ID: 'VentaByID'
        },
        COSECHA: {
            CRUD: 'cosecha'
        }
    }
}
