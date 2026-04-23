interface NetworkInfo {
  hostname: string;
  protocol: string;
  port: string;
  localIPs: string[];
  accessUrls: string[];
}

export const getLocalIPs = (): Promise<string[]> => {
  return new Promise((resolve) => {
    const ips: string[] = [];
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.createDataChannel("");

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => {
        pc.close();
        resolve([]);
      });

    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) {
        pc.close();
        resolve([...new Set(ips)]);
        return;
      }

      const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(
        ice.candidate.candidate
      );
      if (ipMatch && ipMatch[1]) {
        const ip = ipMatch[1];
        if (
          !ip.startsWith("127.") &&
          !ip.startsWith("169.254.") &&
          !ips.includes(ip)
        ) {
          ips.push(ip);
        }
      }
    };

    setTimeout(() => {
      pc.close();
      resolve([...new Set(ips)]);
    }, 3000);
  });
};

export const getNetworkInfo = async (): Promise<NetworkInfo> => {
  const currentUrl = window.location;
  const protocol = currentUrl.protocol;
  const hostname = currentUrl.hostname;
  const port = currentUrl.port;

  const localIPs = await getLocalIPs();

  const accessUrls: string[] = [];
  const portSuffix = port ? `:${port}` : "";

  accessUrls.push(`${protocol}//${hostname}${portSuffix}`);

  localIPs.forEach((ip) => {
    const ipUrl = `${protocol}//${ip}${portSuffix}`;
    if (!accessUrls.includes(ipUrl)) {
      accessUrls.push(ipUrl);
    }
  });

  return {
    hostname,
    protocol,
    port,
    localIPs,
    accessUrls,
  };
};

export const getBestAccessUrl = async (): Promise<string> => {
  const networkInfo = await getNetworkInfo();

  if (
    networkInfo.hostname !== "localhost" &&
    networkInfo.hostname !== "127.0.0.1"
  ) {
    return networkInfo.accessUrls[0];
  }

  if (networkInfo.localIPs.length > 0) {
    const portSuffix = networkInfo.port ? `:${networkInfo.port}` : "";
    return `${networkInfo.protocol}//${networkInfo.localIPs[0]}${portSuffix}`;
  }

  return networkInfo.accessUrls[0];
};

export const checkUrlAccessibility = async (url: string): Promise<boolean> => {
  try {
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
    });
    return true;
  } catch {
    return false;
  }
};

export const getMostAccessibleUrl = async (
  basePath: string = ""
): Promise<{ url: string; allUrls: string[] }> => {
  const networkInfo = await getNetworkInfo();
  const allUrls = networkInfo.accessUrls.map((url) => `${url}${basePath}`);

  return {
    url: allUrls[0],
    allUrls,
  };
};
