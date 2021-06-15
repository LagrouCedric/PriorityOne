from os import stat
from .Database import Database
from datetime import datetime


class DataRepository:
    @staticmethod
    def json_or_formdata(request):
        if request.content_type == 'application/json':
            gegevens = request.get_json()
        else:
            gegevens = request.form.to_dict()
        return gegevens

    @staticmethod
    def read_sensoren():
        sql = 'select * from DeviceHistoriek  order by DeviceHistoriekID desc limit 50'
        return Database.get_rows(sql)

    @staticmethod
    def read_sensor(id):
        sql = 'select * from DeviceHistoriek where DeviceID like %s order by DeviceHistoriekID desc limit 50'
        params = [id]
        return Database.get_rows(sql, params)

    @staticmethod
    def sens_to_database(DeviceHistoriekID, id, value, beschrijving):
        sql = 'insert into DeviceHistoriek(DeviceHistoriekID,DeviceID,NewValue,beschrijving, tijdstip,dag) values(%s,%s,%s,%s,%s,%s) '
        date = datetime.today().strftime('%Y-%m-%d')
        now = datetime.now()

        current_time = now.strftime("%H:%M:%S")
        params = [DeviceHistoriekID, id, value,
                  beschrijving, current_time, date]
        print('doorsturen sens')

        return Database.execute_sql(sql, params)

    @staticmethod
    def state_alarm(newvalue, oldvalue, beschrijving=""):
        now = datetime.now()

        current_time = now.strftime("%H:%M:%S")

        sql = 'insert into DeviceHistoriek(DeviceHistoriekID,DeviceID,NewValue,OldValue,beschrijving, tijdstip) values(0,3,%s,%s,%s,%s)'
        params = [newvalue, oldvalue, beschrijving, current_time]
        return Database.execute_sql(sql, params)

    @staticmethod
    def read_state_device(deviceid):
        sql = 'select * from DeviceHistoriek where DeviceID like %s order by DeviceHistoriekID desc limit 1 '
        params = [deviceid]
        return Database.get_one_row(sql, params)

    @staticmethod
    def read_alarm():
        sql = 'select * from DeviceHistoriek where DeviceID like 3 order by DeviceHistoriekID desc'
        return Database.get_rows(sql)

    @staticmethod
    def read_devices():
        sql = 'select * from Device'
        return Database.get_rows(sql)

    @staticmethod
    def get_pincode():
        sql = 'select pincode from Pincode where Description like %s'
        params = ['Pincode']
        return Database.get_one_row(sql, params)

    @staticmethod
    def change_pincode(pin):
        sql = 'UPDATE Pincode SET pincode=%s WHERE Description like %s'
        params = [pin, 'Pincode']
        return Database.execute_sql(sql, params)

    # @staticmethod
    # def read_status_lampen():
    #     sql = "SELECT * from lampen"
    #     return Database.get_rows(sql)

    # @staticmethod
    # def read_status_lamp_by_id(id):
    #     sql = "SELECT * from lampen WHERE id = %s"
    #     params = [id]
    #     return Database.get_one_row(sql, params)

    # @staticmethod
    # def update_status_lamp(id, status):
    #     sql = "UPDATE lampen SET status = %s WHERE id = %s"
    #     params = [status, id]
    #     return Database.execute_sql(sql, params)

    # @staticmethod
    # def update_status_alle_lampen(status):
    #     sql = "UPDATE lampen SET status = %s"
    #     params = [status]
    #     return Database.execute_sql(sql, params)
