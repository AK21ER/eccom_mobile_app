import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Address } from "@/types";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string, label: string) => void;
  isUpdatingAddress: boolean;
  isDeletingAddress: boolean;
}

export default function AddressCard(
 ) {
  return (
    
  );
}