import React, { Component } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import { MailComposer } from 'expo';

const CONTACT = [
    {
      description: '121, Clear Water Bay Road\n\n\
Clear Water Bay, Kowloon\n\n\
HONG KONG\n\n\
Tel: +852 1234 5678\n\n\
Fax: +852 8765 4321\n\n\
Email:confusion@food.net'
    }
];


class Contact extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contact: CONTACT
        };
    }

    sendMail() {
      MailComposer.composeAsync({
          recipients: ['confusion@food.net'],
          subject: 'Enquiry',
          body: 'To whom it may concern:'
      })
    }

    static navigationOptions = {
        title: 'Contact Us'
    };

    render() {
        return(
            <RenderContactInfo contact={this.state.contact[0]} sendmail={this.sendMail}/>
        );
    }
}

function RenderContactInfo(props) {

    if (props.contact != null) {
        return(
          <ScrollView>
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}>
              <Card
              title="Contact Information"
              >
                <Text style={{margin: 10}}>
                   {props.contact.description}
                </Text>
                <Button
                    title="Send Email"
                    buttonStyle={{backgroundColor: "#512DA8"}}
                    icon={<Icon name='envelope-o' type='font-awesome' color='white' />}
                    onPress={props.sendmail}
                />
              </Card>
            </Animatable.View>
          </ScrollView>
        );
    }
    else {
        return(<View></View>);
    }
}


export default Contact;
