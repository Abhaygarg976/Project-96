document.addEventListener("DOMContentLoaded", function () {
    const user_name = "{{users.0.user_name}}";
    fetch(`/attendance/${user_name}`)
        .then((response) => response.json())
        .then((data) => {
            const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

            const inData = data.filter((row) => row.A_type === 'in').map((row) => ({ x: row.weekday, y: convertTimeToY(row.time_column), time: row.time_column, type: 'In' }));
            const outData = data.filter((row) => row.A_type === 'out').map((row) => ({ x: row.weekday, y: convertTimeToY(row.time_column), time: row.time_column, type: 'Out' }));

            const ctx = document.getElementById("attendanceChart").getContext("2d");
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: weekdays,
                    datasets: [
                        {
                            label: "In",
                            data: inData,
                            backgroundColor: "rgba(40, 167, 69, 0.2)",
                            borderColor: "rgba(40, 167, 69, 1)",
                            borderWidth: 1,
                            fill: false,
                            parsing: {
                                yAxisKey: "y",
                                xAxisKey: "x",
                            },
                        },
                        {
                            label: "Out",
                            data: outData,
                            backgroundColor: "rgba(220, 53, 69, 0.2)",
                            borderColor: "rgba(220, 53, 69, 1)",
                            borderWidth: 1,
                            fill: false,
                            parsing: {
                                yAxisKey: "y",
                                xAxisKey: "x",
                            },
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            reverse: false,
                            grid: {
                                drawBorder: false,
                            },
                            ticks: {
                                stepSize: 2,
                                callback: (value, index, values) => {
                                    const time = convertYToTime(value);
                                    return time;
                                },
                            },
                        },
                        x: {
                            grid: {
                                display: false,
                            },
                        },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const { datasetIndex, dataIndex } = context;
                                    const dataset = context.chart.data.datasets[datasetIndex];
                                    const dataItem = dataset.data[dataIndex];
                                    const { time, type } = dataItem;
                                    return `${time} - ${type}`;
                                },
                            },
                        },
                    },
                },
            });
        })
        .catch((error) => {
            console.error("Error fetching attendance data:", error);
        });
});



function convertTimeToY(time) {
    const hour = parseInt(time.split(":")[0]);
    const minutes = parseInt(time.split(":")[1]);
    const totalMinutes = hour * 60 + minutes;
    return totalMinutes / 120;
}

function convertYToTime(y) {
    const totalMinutes = y * 120;
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHour}:${formattedMinutes}`;
}


document.addEventListener("DOMContentLoaded", function () {
    const user_name = "{{users.0.user_name}}";
    fetch(`/attendance/summary/${user_name}`)
        .then((response) => response.json())
        .then((data) => {
            const summaryContainer = document.getElementById("summaryChart");

            const totalDays = data.length;
            const presentCount = data.reduce((sum, row) => sum + row.present_count, 0);
            const halfdayCount = data.reduce((sum, row) => sum + row.halfday_count, 0);
            const absentCount = data.reduce((sum, row) => sum + row.absent_count, 0);

            const presentPercent = (presentCount / (totalDays * 1.0)) * 100;
            const halfdayPercent = (halfdayCount / (totalDays * 1.0)) * 100;
            const absentPercent = (absentCount / (totalDays * 1.0)) * 100;

            const summaryData = {
                labels: ["Present", "Half-day", "Absent"],
                datasets: [
                    {
                        data: [presentPercent, halfdayPercent, absentPercent],
                        backgroundColor: ["rgba(40, 167, 69, 0.8)", "rgba(255, 193, 7, 0.8)", "rgba(220, 53, 69, 0.8)"],
                    },
                ],
            };

            new Chart(summaryContainer, {
                type: "doughnut",
                data: summaryData,
                options: {
                    plugins: {
                        legend: {
                            display: true,
                            position: "bottom",
                            labels: {
                                font: {
                                    size: 14,
                                },
                            },
                        },
                    },
                },
            });
        })
        .catch((error) => {
            console.error("Error fetching attendance summary:", error);
        });
});
