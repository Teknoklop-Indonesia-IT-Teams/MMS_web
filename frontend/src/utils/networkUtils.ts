/**
 * Network utility functions untuk mendapatkan informasi jaringan
 */

// Interface untuk network info
interface NetworkInfo {
  hostname: string;
  protocol: string;
  port: string;
  localIPs: string[];
  accessUrls: string[];
}

/**
 * Fungsi untuk mendapatkan IP lokal menggunakan WebRTC
 */
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
        resolve([...new Set(ips)]); // Remove duplicates
        return;
      }

      const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(
        ice.candidate.candidate
      );
      if (ipMatch && ipMatch[1]) {
        const ip = ipMatch[1];
        // Filter out loopback dan link-local addresses
        if (
          !ip.startsWith("127.") &&
          !ip.startsWith("169.254.") &&
          !ips.includes(ip)
        ) {
          ips.push(ip);
        }
      }
    };

    // Timeout untuk memastikan fungsi tidak hang
    setTimeout(() => {
      pc.close();
      resolve([...new Set(ips)]);
    }, 3000);
  });
};

/**
 * Fungsi untuk mendapatkan semua informasi network yang tersedia
 */
export const getNetworkInfo = async (): Promise<NetworkInfo> => {
  const currentUrl = window.location;
  const protocol = currentUrl.protocol;
  const hostname = currentUrl.hostname;
  const port = currentUrl.port;

  // Dapatkan local IPs
  const localIPs = await getLocalIPs();

  // Generate possible access URLs
  const accessUrls: string[] = [];
  const portSuffix = port ? `:${port}` : "";

  // Add current URL
  accessUrls.push(`${protocol}//${hostname}${portSuffix}`);

  // Add local IP alternatives
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

/**
 * Fungsi untuk generate URL yang paling cocok berdasarkan konteks
 */
export const getBestAccessUrl = async (): Promise<string> => {
  const networkInfo = await getNetworkInfo();

  // Jika hostname sudah berupa IP atau domain real, gunakan itu
  if (
    networkInfo.hostname !== "localhost" &&
    networkInfo.hostname !== "127.0.0.1"
  ) {
    return networkInfo.accessUrls[0];
  }

  // Jika localhost dan ada local IP, prioritaskan local IP pertama
  if (networkInfo.localIPs.length > 0) {
    const portSuffix = networkInfo.port ? `:${networkInfo.port}` : "";
    return `${networkInfo.protocol}//${networkInfo.localIPs[0]}${portSuffix}`;
  }

  // Fallback ke localhost
  return networkInfo.accessUrls[0];
};

/**
 * Fungsi untuk cek apakah suatu URL dapat diakses
 */
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

/**
 * Fungsi untuk mendapatkan URL yang paling accessible
 */
export const getMostAccessibleUrl = async (
  basePath: string = ""
): Promise<{ url: string; allUrls: string[] }> => {
  const networkInfo = await getNetworkInfo();
  const allUrls = networkInfo.accessUrls.map((url) => `${url}${basePath}`);

  // Test accessibility untuk setiap URL (hanya jika diperlukan)
  // Untuk sekarang, kembalikan yang pertama dan daftar semua opsi
  return {
    url: allUrls[0],
    allUrls,
  };
};
