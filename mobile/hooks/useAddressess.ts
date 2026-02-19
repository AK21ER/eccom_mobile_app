import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Address } from "@/types";

export const useAddresses = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const {
    data: addresses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await api.get<{ addresses: Address[] }>("/users/addresses");
      return data.addresses;
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (addressData: Omit<Address, "_id">) => {
      const { data } = await api.post<{ addresses: Address[] }>("/users/addresses", addressData);
      return data.addresses;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({
      addressId,
      addressData,
    }: {
      addressId: string;
      addressData: Partial<Address>;
    }) => {
      const { data } = await api.put<{ addresses: Address[] }>(
        `/users/addresses/${addressId}`,
        addressData
      );
      return data.addresses;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });



  return {
    addresses: addresses || [],
    isLoading,
    isError,
    addAddress: addAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    
    isAddingAddress: addAddressMutation.isPending,
   
    
  };
};