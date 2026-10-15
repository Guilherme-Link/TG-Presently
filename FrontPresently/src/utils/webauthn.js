function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = window.atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}

function encodeBase64Url(value) {
  const bytes = new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCreationOptions(options) {
  return {
    ...options,
    challenge: decodeBase64Url(options.challenge),
    user: { ...options.user, id: decodeBase64Url(options.user.id) },
    excludeCredentials: (options.excludeCredentials ?? []).map((credential) => ({
      ...credential,
      id: decodeBase64Url(credential.id),
    })),
  };
}

export function decodeRequestOptions(options) {
  return {
    ...options,
    challenge: decodeBase64Url(options.challenge),
    allowCredentials: (options.allowCredentials ?? []).map((credential) => ({
      ...credential,
      id: decodeBase64Url(credential.id),
    })),
  };
}

export function serializeCredential(credential) {
  const response = credential.response;
  const serializedResponse = {
    clientDataJSON: encodeBase64Url(response.clientDataJSON),
  };

  if ("attestationObject" in response) {
    serializedResponse.attestationObject = encodeBase64Url(response.attestationObject);
    if (typeof response.getTransports === "function") {
      serializedResponse.transports = response.getTransports();
    }
  } else {
    serializedResponse.authenticatorData = encodeBase64Url(response.authenticatorData);
    serializedResponse.signature = encodeBase64Url(response.signature);
    serializedResponse.userHandle = response.userHandle
      ? encodeBase64Url(response.userHandle)
      : null;
  }

  return {
    id: credential.id,
    rawId: encodeBase64Url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment,
    response: serializedResponse,
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}
