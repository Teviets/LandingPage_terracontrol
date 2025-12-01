// src/utils/constants/api.js
export const API_CONFIG = {
  BASE_URL: 'https://oz544h1nwc.execute-api.us-east-2.amazonaws.com/dev/',
  TIMEOUT: 3000, // 3 segundos
  SYNC_TIMEOUT: 20000,
  MAX_RETRIES: 3,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const API_NASA_CONFIG = {
  BASE_URL: 'https://power.larc.nasa.gov/api/temporal/',
  Parameters: 'ALLSKY_SFC_PAR_TOT,CLRSKY_SFC_PAR_TOT,ALLSKY_SFC_UVA,ALLSKY_SFC_UVB,ALLSKY_SFC_UV_INDEX,WS2M,T2M,T2MDEW,T2M_RANGE,T2M_MAX,T2M_MIN,QV2M,RH2M,PS,PW',
  TIMEOUT: 3000, // 3 segundos
  MAX_RETRIES: 3,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

export const API_TOMORROW_CONFIG = {
  BASE_URL: 'https://api.tomorrow.io/v4/weather/',
  TIMEOUT: 3000, // 3 segundos
  MAX_RETRIES: 3,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

export const API_OPENAI_CONFIG = {
  BASE_URL: 'https://api.openai.com/v1/',
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

export const HTTP_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
  TIMEOUT_ERROR: 'La solicitud tardó demasiado',
  DEFAULT_ERROR: 'Ocurrió un error inesperado'
};
