
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
    TextInput,
    SafeAreaView,
    StatusBar,
    FlatList,
    Alert,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PackageIcon from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
const baseURL = "https://go-admin.daakit.com"

import Header from "../components/Header";
import { Toast } from 'toastify-react-native';
import { getItem } from '../utils/StorageService';

const CODRemittances = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(30);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedBulkOrders, setSelectedBulkOrders] = useState([]);
    const [bulkOrderAmount, setBulkOrderAmount] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    // Date filter states
    const [showDateModal, setShowDateModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [tempStartDate, setTempStartDate] = useState('');
    const [tempEndDate, setTempEndDate] = useState('');

    // Picker visibility states
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [currentPicker, setCurrentPicker] = useState('start');

    const today = new Date();
    const [filter, setFilter] = useState({
        start_date: today.toISOString().split("T")[0],
        end_date: today.toISOString().split("T")[0],
    });

    const getCodRemittance = async () => {
        setLoading(true);
        try {
            const riderStr = getItem('rider');
            const rider = riderStr
            const token = getItem('token');

            const params = {
                rider_id: rider.id,
                status: filterStatus === 'all' ? '' : filterStatus,
                page,
            };

            if (filter.start_date) {
                params.start_date = filter.start_date;
            }
            if (filter.end_date) {
                params.end_date = filter.end_date;
            }
            const res = await axios.get(`${baseURL}/api/rider/getCodRemittance`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            });

            setData(res.data.data);
            setTotalPages(res.data.pagination.totalPages);
        } catch (err) {
            Alert.alert(
                'Error',
                err.response?.data?.message || err.message || 'Error while fetching data'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBulkInitiated = async () => {
        if (selectedBulkOrders.length === 0) {
            Alert.alert('Error', 'Please select orders to submit');
            return;
        }

        setLoading(true);
        const order_id = selectedBulkOrders.map((o) => o.order_id).join(',');
        try {
            const token = getItem('token');

            await axios.post(
                `${baseURL}/api/rider/initiateCodRemittanceAtRider`,
                { order_id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            Toast.show({
                type: 'success',
                text1: 'COD remittance initiated successfully!',
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            })

            setSelectedBulkOrders([]);
            setBulkOrderAmount(0);
            getCodRemittance();

        } catch (err) {
            Toast.show({
                type: 'error',
                text1: err?.response?.data?.message || 'Error initiating COD remittance. Please try again.',
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            })
        }
    };

    const handleApplyDateFilter = () => {
        setFilter({
            start_date: tempStartDate || filter.start_date,
            end_date: tempEndDate || filter.end_date
        });
        setPage(1);
        setShowDateModal(false);
    };

    const handleClearDateFilter = () => {
        setTempStartDate('');
        setTempEndDate('');
        setStartDate('');
        setEndDate('');
        setPage(1);
        setShowDateModal(false);
    };

    const onDateChange = (event, selectedDate) => {
        if (currentPicker === 'start') {
            setShowStartPicker(Platform.OS === 'ios');
            if (selectedDate) {
                const formattedDate = selectedDate.toISOString().split('T')[0];
                setTempStartDate(formattedDate);
                setFilter(prev => ({ ...prev, start_date: formattedDate }));
                // Auto-show end date picker on Android after start date is selected
                if (Platform.OS === 'android') {
                    setTimeout(() => {
                        setCurrentPicker('end');
                        setShowEndPicker(true);
                    }, 300);
                }
            }
        } else {
            setShowEndPicker(Platform.OS === 'ios');
            if (selectedDate) {
                const formattedDate = selectedDate.toISOString().split('T')[0];
                setTempEndDate(formattedDate);
                setFilter(prev => ({ ...prev, end_date: formattedDate }));
            }
        }
    };

    const toggleOrderSelection = (order) => {
        const isSelected = selectedBulkOrders.some(o => o.id === order.id);

        if (isSelected) {
            setSelectedBulkOrders(prev => prev.filter(o => o.id !== order.id));
            setBulkOrderAmount(prev => prev - Number(order.amount));
        } else {
            setSelectedBulkOrders(prev => [...prev, order]);
            setBulkOrderAmount(prev => prev + Number(order.amount));
        }
    };

    useEffect(() => {
        getCodRemittance();
    }, [page, filterStatus, filter.start_date, filter.end_date]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'received':
            case 'adjusted':
                return { bg: '#dcfce7', text: '#166534' };
            case 'initiated':
                return { bg: '#dbeafe', text: '#1e40af' };
            case 'pending':
                return { bg: '#fef9c3', text: '#854d0e' };
            default:
                return { bg: '#f3f4f6', text: '#374151' };
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'initiated': return 'Initiated';
            case 'adjusted': return 'Adjusted';
            case 'received': return 'Submitted';
            default: return status;
        }
    };

    const renderOrderItem = ({ item }) => {
        const isSelected = selectedBulkOrders.some(o => o.id === item.id);
        const statusColors = getStatusColor(item.status);

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => filterStatus === 'pending' && toggleOrderSelection(item)}
                style={[
                    styles.orderCard,
                    isSelected && styles.selectedCard
                ]}
            >
                <View style={styles.orderHeader}>
                    <View style={styles.orderLeftSection}>
                        {filterStatus === 'pending' && (
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Icon name="check" size={12} color="#fff" />}
                            </View>
                        )}
                        <View style={styles.orderInfo}>
                            <Icon name="cube" size={16} color="#9ca3af" />
                            <Text style={styles.orderId}>
                                {item.merchant_order_id?.substring(0, 20)}
                                {item.merchant_order_id?.length > 20 && '...'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.amountContainer}>
                        <Icon name="rupee" size={14} color="#16a34a" />
                        <Text style={styles.amount}>
                            {Number(item.amount).toLocaleString()}
                        </Text>
                    </View>
                </View>

                <View style={styles.orderFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                        <Text style={[styles.statusText, { color: statusColors.text }]}>
                            {getStatusText(item.status)}
                        </Text>
                    </View>

                    {item.created_at && (
                        <Text style={styles.dateText}>
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.title}>COD Remittances</Text>
                    <Text style={styles.subtitle}>Manage your cash on delivery orders</Text>
                </View>
                <View style={styles.headerButtons}>
                    {/* {(filter.start_date || filter.end_date) && (
                        <View style={styles.dateIndicator}>
                            <Icon name="calendar" size={14} color="#564ec1" />
                            <Text style={styles.dateIndicatorText}>
                                {filter.start_date && filter.end_date
                                    ? `${filter.start_date} to ${filter.end_date}`
                                    : filter.start_date
                                        ? `From ${filter.start_date}`
                                        : `To ${filter.end_date}`}
                            </Text>
                        </View>
                    )} */}
                    <TouchableOpacity
                        onPress={() => {
                            setTempStartDate(filter.start_date);
                            setTempEndDate(filter.end_date);
                            setShowDateModal(true);
                        }}
                        style={styles.iconButton}
                    >
                        <Icon name="calendar" size={20} color="#564ec1" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        style={styles.iconButton}
                    >
                        <Icon name="filter" size={20} color="#564ec1" />
                    </TouchableOpacity>
                </View>
            </View>

            {showFilters && (
                <View style={styles.filtersContainer}>
                    {['all', 'pending', 'initiated', 'adjusted', 'received'].map((status) => (
                        <TouchableOpacity
                            className=' whitespace-nowrap px-0'
                            key={status}
                            onPress={() => setFilterStatus(status)}
                            style={[
                                styles.filterButton,
                                filterStatus === status && styles.filterButtonActive
                            ]}
                        >
                            <Text

                                style={[
                                    styles.filterButtonText,
                                    filterStatus === status && styles.filterButtonTextActive
                                ]}
                            // numberOfLines={1}
                            // ellipsizeMode="tail"
                            >
                                {status}
                                {/* {status === 'all' ? 'All' : getStatusText(status)} */}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {selectedBulkOrders.length > 0 && filterStatus === 'pending' && (
                <View style={styles.bulkActionBar}>
                    <View>
                        <Text style={styles.bulkActionText}>
                            {selectedBulkOrders.length} orders selected
                        </Text>
                        <Text style={styles.bulkActionAmount}>
                            ₹{bulkOrderAmount.toLocaleString()}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleBulkInitiated}
                        style={styles.submitButton}
                    >
                        <Icon name="check" size={16} color="#fff" />
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderFooter = () => (
        data.length > 0 && (
            <View style={styles.paginationContainer}>
                <View style={styles.pagination}>
                    <TouchableOpacity
                        onPress={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        style={[
                            styles.paginationButton,
                            page === 1 && styles.paginationButtonDisabled
                        ]}
                    >
                        <Icon
                            name="chevron-left"
                            size={20}
                            color={page === 1 ? '#9ca3af' : '#fff'}
                        />
                        <Text style={[
                            styles.paginationButtonText,
                            page === 1 && styles.paginationButtonTextDisabled
                        ]}>
                            Prev
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.pageInfo}>
                        <Text style={styles.pageText}>Page {page}</Text>
                        <Text style={styles.pageSeparator}>of</Text>
                        <Text style={styles.pageTotal}>{totalPages}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        style={[
                            styles.paginationButton,
                            page === totalPages && styles.paginationButtonDisabled
                        ]}
                    >
                        <Text style={[
                            styles.paginationButtonText,
                            page === totalPages && styles.paginationButtonTextDisabled
                        ]}>
                            Next
                        </Text>
                        <Icon
                            name="chevron-right"
                            size={20}
                            color={page === totalPages ? '#9ca3af' : '#fff'}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={getCodRemittance}
                    style={styles.refreshButton}
                >
                    <Icon name="refresh-cw" size={14} color="#564ec1" />
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
            </View>
        )
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header title="COD Remittances" showBack={true} />
            {renderHeader()}

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#564ec1" />
                    <Text style={{ marginTop: 12, color: '#6b7280', fontWeight: '500' }}>Loading Data...</Text>
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <PackageIcon name="package" size={32} color="#9ca3af" />
                            </View>
                            <Text style={styles.emptyTitle}>No COD orders found</Text>
                            <Text style={styles.emptyText}>
                                No COD remittances available for the selected filter
                            </Text>
                        </View>
                    }
                    ListFooterComponent={renderFooter}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Date Filter Modal */}
            <Modal
                visible={showDateModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter by Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowDateModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="calendar" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {/* Start Date Picker Button */}
                            <TouchableOpacity
                                style={[styles.datePickerButton, tempStartDate && styles.datePickerButtonActive]}
                                onPress={() => {
                                    setCurrentPicker('start');
                                    setShowStartPicker(true);
                                }}
                            >
                                <Text style={styles.datePickerLabel}>Start Date</Text>
                                <View style={styles.datePickerValue}>
                                    <Icon name="calendar" size={18} color="#564ec1" />
                                    <Text style={tempStartDate ? styles.datePickerText : styles.datePickerPlaceholder}>
                                        {tempStartDate || "Select Start Date"}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* End Date Picker Button */}
                            <TouchableOpacity
                                style={[
                                    styles.datePickerButton,
                                    tempEndDate && styles.datePickerButtonActive,
                                    !tempStartDate && styles.datePickerButtonDisabled
                                ]}
                                onPress={() => {
                                    if (tempStartDate) {
                                        setCurrentPicker('end');
                                        setShowEndPicker(true);
                                    }
                                }}
                                disabled={!tempStartDate}
                            >
                                <Text style={styles.datePickerLabel}>End Date</Text>
                                <View style={styles.datePickerValue}>
                                    <Icon
                                        name="calendar"
                                        size={18}
                                        color={tempStartDate ? "#564ec1" : "#9ca3af"}
                                    />
                                    <Text style={!tempStartDate ? styles.datePickerPlaceholder : (tempEndDate ? styles.datePickerText : styles.datePickerPlaceholder)}>
                                        {tempEndDate || (tempStartDate ? "Select End Date" : "Select Start Date First")}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Android Date Pickers */}
                            {showStartPicker && Platform.OS === 'android' && (
                                <DateTimePicker
                                    value={tempStartDate ? new Date(tempStartDate) : new Date()}
                                    mode="date"
                                    display="calendar"
                                    onChange={onDateChange}
                                />
                            )}

                            {showEndPicker && Platform.OS === 'android' && (
                                <DateTimePicker
                                    value={tempEndDate ? new Date(tempEndDate) : (tempStartDate ? new Date(tempStartDate) : new Date())}
                                    mode="date"
                                    display="calendar"
                                    onChange={onDateChange}
                                    minimumDate={tempStartDate ? new Date(tempStartDate) : undefined}
                                />
                            )}

                            {/* iOS Date Pickers */}
                            {Platform.OS === 'ios' && (
                                <>
                                    {showStartPicker && (
                                        <View style={styles.iosPickerContainer}>
                                            <Text style={styles.iosPickerTitle}>Select Start Date</Text>
                                            <DateTimePicker
                                                value={tempStartDate ? new Date(tempStartDate) : new Date()}
                                                mode="date"
                                                display="spinner"
                                                onChange={(event, date) => {
                                                    if (date) {
                                                        setTempStartDate(date.toISOString().split('T')[0]);
                                                    }
                                                }}
                                                style={styles.iosPicker}
                                            />
                                            <TouchableOpacity
                                                style={styles.iosPickerDoneButton}
                                                onPress={() => {
                                                    setShowStartPicker(false);
                                                    setTimeout(() => {
                                                        setCurrentPicker('end');
                                                        setShowEndPicker(true);
                                                    }, 300);
                                                }}
                                            >
                                                <Text style={styles.iosPickerDoneText}>Next</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {showEndPicker && (
                                        <View style={styles.iosPickerContainer}>
                                            <Text style={styles.iosPickerTitle}>Select End Date</Text>
                                            <DateTimePicker
                                                value={tempEndDate ? new Date(tempEndDate) : (tempStartDate ? new Date(tempStartDate) : new Date())}
                                                mode="date"
                                                display="spinner"
                                                onChange={(event, date) => {
                                                    if (date) {
                                                        setTempEndDate(date.toISOString().split('T')[0]);
                                                    }
                                                }}
                                                minimumDate={tempStartDate ? new Date(tempStartDate) : undefined}
                                                style={styles.iosPicker}
                                            />
                                            <TouchableOpacity
                                                style={styles.iosPickerDoneButton}
                                                onPress={() => setShowEndPicker(false)}
                                            >
                                                <Text style={styles.iosPickerDoneText}>Done</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </>
                            )}

                            {/* Action Buttons */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    onPress={handleClearDateFilter}
                                    style={styles.modalClearButton}
                                >
                                    <Text style={styles.modalClearButtonText}>Clear</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleApplyDateFilter}
                                    style={[styles.modalApplyButton, !tempStartDate && styles.modalApplyButtonDisabled]}
                                    disabled={!tempStartDate}
                                >
                                    <Text style={[styles.modalApplyButtonText, !tempStartDate && styles.modalApplyButtonTextDisabled]}>
                                        Apply Filter
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        // elevation: 4,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.04,
        // shadowRadius: 12,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 4,
        fontWeight: '500',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        padding: 10,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
    },
    dateIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        gap: 4,
    },
    dateIndicatorText: {
        fontSize: 10,
        color: '#564ec1',
        fontWeight: '500',
    },
    filtersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flex: 1,
        minWidth: 60
    },
    filterButtonActive: {
        backgroundColor: '#0446DB',
        borderColor: '#564ec1',
        shadowColor: '#564ec1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    filterButtonText: {
        fontSize: 12,
        color: '#4b5563',
        textAlign: 'center',
        fontWeight: '500',
        includeFontPadding: false,
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    bulkActionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        padding: 12,
        backgroundColor: '#f0fdf4',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    bulkActionText: {
        fontSize: 12,
        color: '#166534',
        fontWeight: '500',
    },
    bulkActionAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#166534',
        marginTop: 2,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16a34a',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 24,
        paddingTop: 24,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    selectedCard: {
        borderWidth: 2,
        borderColor: '#564ec1',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderLeftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#564ec1',
        borderColor: '#564ec1',
    },
    orderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        flex: 1,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    amount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#16a34a',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 10,
        color: '#9ca3af',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyIconContainer: {
        width: 64,
        height: 64,
        backgroundColor: '#f3f4f6',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    paginationContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paginationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#564ec1',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    paginationButtonDisabled: {
        backgroundColor: '#f3f4f6',
    },
    paginationButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    paginationButtonTextDisabled: {
        color: '#9ca3af',
    },
    pageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pageText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
    },
    pageSeparator: {
        fontSize: 14,
        color: '#9ca3af',
    },
    pageTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
    },
    refreshButtonText: {
        fontSize: 12,
        color: '#564ec1',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalBody: {
        padding: 16,
    },
    datePickerButton: {
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#f9fafb',
    },
    datePickerButtonActive: {
        borderColor: '#564ec1',
        backgroundColor: '#f5f3ff',
    },
    datePickerButtonDisabled: {
        opacity: 0.5,
    },
    datePickerLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    datePickerValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    datePickerText: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    datePickerPlaceholder: {
        fontSize: 14,
        color: '#9ca3af',
    },
    iosPickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    iosPickerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    iosPicker: {
        height: 120,
    },
    iosPickerDoneButton: {
        backgroundColor: '#564ec1',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 8,
    },
    iosPickerDoneText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    modalClearButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
    },
    modalClearButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
    },
    modalApplyButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#564ec1',
        alignItems: 'center',
    },
    modalApplyButtonDisabled: {
        backgroundColor: '#d1d5db',
    },
    modalApplyButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
    },
    modalApplyButtonTextDisabled: {
        color: '#9ca3af',
    },
};

export default CODRemittances;