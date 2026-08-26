// import { useState } from "react";
// import axios from "axios";
// import { Toast } from "toastify-react-native";
// import { Text, TouchableOpacity, View, Linking } from "react-native";
// import { getItem } from "./StorageService";
// import { initializeEasebuzzCheckout } from 'react-native-easebuzz-sdk';
// const baseUrl = 'https://go-admin.daakit.com';

// function GenerateUPI({ orderId, amount }) {
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const handleSubmit = async () => {
//         const token = getItem("token");
//         setLoading(true);
//         setError('');

//         try {
//             console.log(orderId)
//             console.log(amount)

//             const response = await axios.post(`${baseUrl}/api/payment/create-payment-link`, {
//                 order_id: orderId,
//                 amount: parseFloat(amount),

//             }, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 }
//             });

//             const accessKey = response.datapayment_link;
//             const payMode = "test";

//             if (accessKey) {
//                 console.log(accessKey)
//                 console.log(payMode)
//                 initiatePayment()
//             }


//             const initiatePayment = async () => {

//                 try {
//                     const response = await
//                         initializeEasebuzzCheckout(accessKey, payMode);

//                     console.log("Ease Payment Response:", response);
//                 } catch (error) {
//                     console.error("Payment Failed:", error);
//                 }
//             };





//             return
//             if (response.data.success && response.data.payment_link) {
//                 console.log(response.data.payment_link)
//                 const paymentLink = `https://pay.easebuzz.in/pay/${response.data.payment_link}`;

//                 try {
//                     await Linking.openURL(paymentLink);
//                 } catch (openError) {
//                     Toast.show({
//                         type: 'error',
//                         text1: 'Cannot open payment link',
//                         text2: openError.message || 'Unsupported URL',
//                         position: 'top',
//                         visibilityTime: 4000,
//                         autoHide: true,
//                     });
//                 }

//             } else {
//                 setError('Failed to generate payment link.');
//             }
//         } catch (err) {
//             console.log(err.response)
//             Toast.show({
//                 type: 'error',
//                 text1: err.response?.data?.message || err.message || "Error generating link",
//                 position: 'top',
//                 visibilityTime: 4000,
//                 autoHide: true,

//             })

//             setError(err.response?.data?.message || 'Server error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <View>

//             <TouchableOpacity
//                 onPress={handleSubmit}

//                 className={`px-4 py-2 mb-2 rounded-lg font-medium text-white text-sm transition w-full ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
//                     }`}
//                 disabled={loading}
//             >
//                 <View className=" py-2">
//                     <Text className=" text-center text-white">{loading ? 'Generating...' : 'UPI'}</Text>
//                 </View>
//             </TouchableOpacity>

//             {/* {error && (
//                 <Text className="text-red-600 mt-2 text-sm">
//                     {error}
//                 </Text>
//             )} */}
//         </View>
//     );

// }

// export default GenerateUPI;


import { useState } from "react";
import axios from "axios";
import { Toast } from "toastify-react-native";
import { Text, TouchableOpacity, View, Linking } from "react-native";
import { getItem } from "./StorageService";
import { initializeEasebuzzCheckout } from "react-native-easebuzz-sdk";

const baseUrl = "https://go-admin.daakit.com";

function GenerateUPI({ orderId, amount }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const token = await getItem("token");
    setLoading(true);
    setError("");

    try {
      console.log("Order ID:", orderId);
      console.log("Amount:", amount);

      const response = await axios.post(
        `${baseUrl}/api/payment/create-payment-link`,
        {
          order_id: orderId,
          amount: parseFloat(amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);

      const accessKey =
        response.data?.access_key ||
        response.data?.payment_link ||
        response.data?.data;

      const payMode = "production"; 

      if (accessKey) {
        try {
          const paymentResponse = await initializeEasebuzzCheckout(
            accessKey,
            payMode
          );

          console.log("Ease Payment Response:", paymentResponse);
        } catch (paymentError) {
          console.error("Payment Failed:", paymentError);

          Toast.show({
            type: "error",
            text1: "Payment SDK failed",
            text2: paymentError?.message || "Unable to open Easebuzz SDK",
            position: "top",
            visibilityTime: 4000,
            autoHide: true,
          });
        }

        return;
      }

      return

      if (response.data.success && response.data.payment_link) {
        console.log(response.data.payment_link);
        const paymentLink = `https://pay.easebuzz.in/pay/${response.data.payment_link}`;

        try {
          await Linking.openURL(paymentLink);
        } catch (openError) {
          Toast.show({
            type: "error",
            text1: "Cannot open payment link",
            text2: openError.message || "Unsupported URL",
            position: "top",
            visibilityTime: 4000,
            autoHide: true,
          });
        }
      } else {
        setError("Failed to generate payment link.");
      }
    } catch (err) {
      console.log("Payment API Error:", err.response?.data || err.message);

      Toast.show({
        type: "error",
        text1: err.response?.data?.message || err.message || "Error generating link",
        position: "top",
        visibilityTime: 4000,
        autoHide: true,
      });

      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handleSubmit}
        className={`px-4 py-2 mb-2 rounded-lg font-medium text-white text-sm transition w-full ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
        disabled={loading}
      >
        <View className="py-2">
          <Text className="text-center text-white">
            {loading ? "Generating..." : "UPI"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* {error && (
          <Text className="text-red-600 mt-2 text-sm">
              {error}
          </Text>
      )} */}
    </View>
  );
}

export default GenerateUPI;