import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form"; // Import useFormContext
import { Input } from "./ui/input";

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: any;
        };
      };
    };
  }
}

export const GoogleAddressInput = ({ field }: any) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { setValue } = useFormContext();
  const debounce = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    const input = inputRef.current;
    debounce.current = setTimeout(() => {
      if (input && window.google) {
        const autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.addListener("place_changed", function () {
          const place = autocomplete.getPlace();
          let street = "";
          let city = "";
          let province = "";
          let zipCode = "";
          let country = "";
          const fullAddress = place?.formatted_address;
          place?.address_components?.forEach((component: any) => {
            const types = component.types;
            if (types.includes("street_number") || types.includes("route")) {
              street += component.long_name + " ";
            }
            if (types.includes("locality")) {
              city = component.long_name;
            }
            if (types.includes("administrative_area_level_1")) {
              province = component.long_name;
            }
            if (types.includes("postal_code")) {
              zipCode = component.long_name;
            }
            if (types.includes("country")) {
              country = component.long_name;
            }
          });

          setValue(field?.name, fullAddress);
          setValue("streetAddress", street.trim());
          setValue("city", city);
          setValue("state", province);
          setValue("zipCode", zipCode);
          setValue("country", country);
        });
      }
    }, 1000);
    return () => clearTimeout(debounce.current);
  }, [field, setValue]);

  return (
    <div>
      <div className="row">
        <div className="col-md-12">
          <Input
            aria-autocomplete="none"
            autoComplete="off"
            placeholder="Search address..."
            {...field}
            ref={inputRef}
          />
        </div>
      </div>
    </div>
  );
};
