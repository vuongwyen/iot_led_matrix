const ws = new WebSocket('ws://192.168.1.114:3000');
//const socket = new WebSocket('ws://10.0.1.125:3000');
ws.onopen = () => {
    console.log('WebSocket connection opened');
};

ws.onmessage = (event) => {
    console.log('Received from server:', event.data);

    // Kiểm tra nếu dữ liệu nhận được là một Blob
    if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = function () {
            const textData = reader.result;

            // Sau khi chuyển đổi, xử lý như dữ liệu JSON
            try {
                const data = JSON.parse(textData);
                if (data.temperature !== undefined && data.humidity !== undefined) {
                    // Cập nhật nội dung của các phần tử HTML
                    document.getElementById('tempData').innerText = data.temperature + ' °C';
                    document.getElementById('humidityData').innerText = data.humidity + ' %';
                } else {
                    console.error('Data received is not in expected format:', textData);
                }
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        };
        reader.readAsText(event.data);
    }
    // Nếu là chuỗi (text), xử lý như bình thường
    else if (typeof event.data === 'string') {
        if (event.data === 'getData') {
            console.log('Received "getData" command from server');
        } else {
            // Xử lý dữ liệu JSON
            try {
                const data = JSON.parse(event.data);
                if (data.temperature !== undefined && data.humidity !== undefined) {
                    // Cập nhật nội dung của các phần tử HTML  
                    document.getElementById('tempData').innerText = data.temperature + ' °C';
                    document.getElementById('humidityData').innerText = data.humidity + ' %';
                } else {
                    console.error('Data received is not in expected format:', event.data);
                }
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        }
    } else {
        console.error('Received unsupported data type:', event.data);
    }
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

document.getElementById('sendCommand').addEventListener('click', () => {
    if (ws.readyState === WebSocket.OPEN) {
        const command = 'getData';
        ws.send(command);
        console.log(`Frontend req server ${command}`);
    } else {
        console.error('WebSocket is not open');
    }
});


window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});
