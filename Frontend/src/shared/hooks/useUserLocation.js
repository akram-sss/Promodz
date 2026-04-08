import { useEffect, useState } from 'react';

function useUserLocation() {
  const [location, setLocation] = useState(null);

    useEffect(() => {
    const controller = new AbortController();

    fetch("https://ipinfo.io/json?token=dc7953aa597db5", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`ipinfo request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data?.loc) return;
        const [lat, lon] = String(data.loc).split(",");
        setLocation({
          ip: data.ip,
          city: data.city,
          wilaya: data.region,
          country: data.country,
          lat,
          lon,
        });
      })
      .catch(() => {
        // ignore: location is optional for app UI
      });

    return () => controller.abort();
    }, []);


  return location;
}

export default useUserLocation;
